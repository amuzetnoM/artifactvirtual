#!/usr/bin/env python
"""
Test runner for InputUnitSim module

This script runs all tests for the EnhancedInputUnitSimulator.
It can be used to run individual test modules or the full test suite.
"""

import os
import sys
import unittest
import argparse
import coverage

# Add parent directory to path to import simulator code
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def run_tests_with_coverage(test_pattern=None):
    """Run tests with coverage reporting"""
    cov = coverage.Coverage(
        source=['inputunit'],
        omit=['*/__pycache__/*', '*/tests/*'],
        include=['*inputunit.py']
    )
    cov.start()
    
    # Discover and run tests
    if test_pattern:
        test_suite = unittest.defaultTestLoader.discover('.', pattern=test_pattern)
    else:
        test_suite = unittest.defaultTestLoader.discover('.')
    
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    cov.stop()
    cov.save()
    
    # Print coverage report
    print("\nCoverage Report:")
    cov.report()
    
    # Generate HTML report
    cov.html_report(directory='coverage_report')
    print(f"HTML coverage report generated in 'coverage_report' directory")
    
    return result

def run_tests(test_pattern=None):
    """Run tests without coverage"""
    # Discover and run tests
    if test_pattern:
        test_suite = unittest.defaultTestLoader.discover('.', pattern=test_pattern)
    else:
        test_suite = unittest.defaultTestLoader.discover('.')
    
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run tests for InputUnitSim')
    parser.add_argument('--pattern', '-p', type=str, default=None, 
                        help='Test file pattern (e.g., "test_algorithms.py")')
    parser.add_argument('--coverage', '-c', action='store_true',
                        help='Generate coverage report')
    
    args = parser.parse_args()
    
    print("="*80)
    print(f"Running {'all tests' if not args.pattern else f'tests matching {args.pattern}'}")
    print(f"Coverage reporting is {'enabled' if args.coverage else 'disabled'}")
    print("="*80)
    
    if args.coverage:
        result = run_tests_with_coverage(args.pattern)
    else:
        result = run_tests(args.pattern)
    
    # Exit with appropriate code for CI systems
    if not result.wasSuccessful():
        sys.exit(1)