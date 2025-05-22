# Task Queue with Dependency Management
from collections import deque

class Task:
    def __init__(self, command, dependencies=None):
        self.command = command
        self.dependencies = dependencies or []
        self.completed = False

class TaskQueue:
    def __init__(self):
        self.tasks = []
        self.history = []

    def add_task(self, task):
        self.tasks.append(task)

    def get_ready_tasks(self):
        # Return tasks whose dependencies are all completed
        ready = []
        for task in self.tasks:
            if not task.completed and all(dep.completed for dep in task.dependencies):
                ready.append(task)
        return ready

    def mark_completed(self, task):
        task.completed = True
        self.history.append(task)

    def all_completed(self):
        return all(task.completed for task in self.tasks)
