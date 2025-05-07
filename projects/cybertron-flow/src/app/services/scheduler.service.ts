import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ScheduledJob {
  id: string;
  name: string;
  workflowId: string;
  cronExpression: string;
  enabled: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobExecutionEvent {
  jobId: string;
  workflowId: string;
  timestamp: Date;
  status: 'started' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private jobs: ScheduledJob[] = [];
  private activeTimers: Map<string, { subscription: any, stopSignal: Subject<void> }> = new Map();
  private jobExecutionEvents = new Subject<JobExecutionEvent>();
  private jobsChanged = new BehaviorSubject<ScheduledJob[]>([]);
  
  constructor() {
    // Load saved jobs on service initialization
    this.loadSavedJobs();
  }
  
  /**
   * Get all scheduled jobs
   */
  getJobs(): Observable<ScheduledJob[]> {
    return this.jobsChanged.asObservable();
  }
  
  /**
   * Get job execution events
   */
  getJobExecutionEvents(): Observable<JobExecutionEvent> {
    return this.jobExecutionEvents.asObservable();
  }
  
  /**
   * Add a new scheduled job
   */
  addJob(job: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt'>): ScheduledJob {
    const now = new Date();
    const newJob: ScheduledJob = {
      ...job,
      id: `job_${Date.now()}`,
      lastRun: null,
      nextRun: this.calculateNextRun(job.cronExpression),
      createdAt: now,
      updatedAt: now
    };
    
    this.jobs.push(newJob);
    this.saveJobs();
    
    if (newJob.enabled) {
      this.startJobSchedule(newJob);
    }
    
    this.jobsChanged.next([...this.jobs]);
    return newJob;
  }
  
  /**
   * Update an existing job
   */
  updateJob(jobId: string, updates: Partial<ScheduledJob>): ScheduledJob | null {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) return null;
    
    // Stop current schedule if it exists
    this.stopJobSchedule(jobId);
    
    // Update the job
    const updatedJob: ScheduledJob = {
      ...this.jobs[jobIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    // If cron expression changed, recalculate next run time
    if (updates.cronExpression) {
      updatedJob.nextRun = this.calculateNextRun(updatedJob.cronExpression);
    }
    
    this.jobs[jobIndex] = updatedJob;
    this.saveJobs();
    
    // Restart schedule if enabled
    if (updatedJob.enabled) {
      this.startJobSchedule(updatedJob);
    }
    
    this.jobsChanged.next([...this.jobs]);
    return updatedJob;
  }
  
  /**
   * Delete a job
   */
  deleteJob(jobId: string): boolean {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) return false;
    
    // Stop the job schedule
    this.stopJobSchedule(jobId);
    
    // Remove the job
    this.jobs.splice(jobIndex, 1);
    this.saveJobs();
    
    this.jobsChanged.next([...this.jobs]);
    return true;
  }
  
  /**
   * Enable or disable a job
   */
  setJobEnabled(jobId: string, enabled: boolean): boolean {
    const job = this.jobs.find(job => job.id === jobId);
    if (!job) return false;
    
    job.enabled = enabled;
    job.updatedAt = new Date();
    
    if (enabled) {
      this.startJobSchedule(job);
    } else {
      this.stopJobSchedule(jobId);
    }
    
    this.saveJobs();
    this.jobsChanged.next([...this.jobs]);
    return true;
  }
  
  /**
   * Manually run a job immediately
   */
  runJobNow(jobId: string): void {
    const job = this.jobs.find(job => job.id === jobId);
    if (!job) return;
    
    job.lastRun = new Date();
    this.saveJobs();
    
    // Emit started event
    this.jobExecutionEvents.next({
      jobId: job.id,
      workflowId: job.workflowId,
      timestamp: new Date(),
      status: 'started'
    });
    
    // In a real implementation, this would execute the workflow
    // For now, we'll just simulate success after a delay
    setTimeout(() => {
      this.jobExecutionEvents.next({
        jobId: job.id,
        workflowId: job.workflowId,
        timestamp: new Date(),
        status: 'completed',
        result: { message: 'Job executed successfully' }
      });
      
      // Update next run time
      job.nextRun = this.calculateNextRun(job.cronExpression);
      this.saveJobs();
      this.jobsChanged.next([...this.jobs]);
    }, 2000);
  }
  
  /**
   * Start the schedule for a job
   */
  private startJobSchedule(job: ScheduledJob): void {
    // Stop any existing schedule
    this.stopJobSchedule(job.id);
    
    // Create a stop signal
    const stopSignal = new Subject<void>();
    
    // For this demo, we'll use a simple interval instead of actual cron parsing
    // In a real application, use a proper cron parser library
    const subscription = interval(this.getIntervalFromCronExpression(job.cronExpression))
      .pipe(takeUntil(stopSignal))
      .subscribe(() => this.runJobNow(job.id));
    
    // Store the subscription and stop signal
    this.activeTimers.set(job.id, { subscription, stopSignal });
  }
  
  /**
   * Stop the schedule for a job
   */
  private stopJobSchedule(jobId: string): void {
    const timer = this.activeTimers.get(jobId);
    if (timer) {
      timer.stopSignal.next();
      timer.stopSignal.complete();
      this.activeTimers.delete(jobId);
    }
  }
  
  /**
   * Save jobs to local storage
   */
  private saveJobs(): void {
    localStorage.setItem('cybertron-flow-jobs', JSON.stringify(this.jobs));
  }
  
  /**
   * Load jobs from local storage
   */
  private loadSavedJobs(): void {
    try {
      const savedJobs = localStorage.getItem('cybertron-flow-jobs');
      if (savedJobs) {
        this.jobs = JSON.parse(savedJobs);
        
        // Parse dates
        this.jobs = this.jobs.map(job => ({
          ...job,
          lastRun: job.lastRun ? new Date(job.lastRun) : null,
          nextRun: job.nextRun ? new Date(job.nextRun) : null,
          createdAt: new Date(job.createdAt),
          updatedAt: new Date(job.updatedAt)
        }));
        
        // Start schedule for enabled jobs
        this.jobs.forEach(job => {
          if (job.enabled) {
            this.startJobSchedule(job);
          }
        });
        
        this.jobsChanged.next([...this.jobs]);
      }
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    }
  }
  
  /**
   * Calculate the next run time based on a cron expression
   * In a real application, use a proper cron parser library
   */
  private calculateNextRun(cronExpression: string): Date {
    // Simple implementation for demo purposes
    // In a real application, use a cron parser library
    const now = new Date();
    const minutes = parseInt(cronExpression.split(' ')[0], 10) || 5;
    return new Date(now.getTime() + minutes * 60000);
  }
  
  /**
   * Get interval in milliseconds from a simplified cron expression
   * This is a simple implementation for demo purposes
   */
  private getIntervalFromCronExpression(cronExpression: string): number {
    // For demo, we'll just extract minutes from first part of expression
    const minutes = parseInt(cronExpression.split(' ')[0], 10) || 5;
    return minutes * 60000; // Convert to milliseconds
  }
}