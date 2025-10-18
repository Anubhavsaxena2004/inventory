#!/usr/bin/env python3
"""
Script to start the Django development server with proper error handling
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import django
        import rest_framework
        print(f"✅ Django {django.get_version()} is installed")
        print(f"✅ Django REST Framework is installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install Django==5.2.7 djangorestframework==3.15.0 django-cors-headers==4.0.0")
        return False

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running database migrations...")
    try:
        result = subprocess.run([
            sys.executable, 'backend/manage.py', 'migrate'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print("✅ Migrations completed successfully")
            return True
        else:
            print(f"❌ Migration failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def start_server():
    """Start the Django development server"""
    print("🚀 Starting Django development server...")
    print("   Server will be available at: http://127.0.0.1:8000")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, 'backend/manage.py', 'runserver', '127.0.0.1:8000'
        ], cwd=os.getcwd())
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main function"""
    print("🏭 Inventory Management System - Server Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/manage.py'):
        print("❌ Error: backend/manage.py not found")
        print("   Please run this script from the project root directory")
        return False
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    # Run migrations
    if not run_migrations():
        return False
    
    # Start server
    start_server()
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
