# Smart To-Do List Pro

```python
import json
from datetime import datetime

FILE_NAME = "tasks.json"


def load_tasks():
    try:
        with open(FILE_NAME, "r") as file:
            return json.load(file)
    except:
        return []


def save_tasks(tasks):
    with open(FILE_NAME, "w") as file:
        json.dump(tasks, file, indent=4)


def add_task(tasks):
    title = input("Enter task title: ")
    priority = input("Priority (High/Medium/Low): ")
    due_date = input("Due date (YYYY-MM-DD): ")

    task = {
        "title": title,
        "priority": priority,
        "due_date": due_date,
        "completed": False
    }

    tasks.append(task)
    print("Task added successfully!\n")


def view_tasks(tasks):
    if not tasks:
        print("No tasks available.\n")
        return

    print("\n--- TASK LIST ---")

    for i, task in enumerate(tasks):
        status = "Done" if task["completed"] else "Pending"

        print(f"{i + 1}. {task['title']}")
        print(f"   Priority : {task['priority']}")
        print(f"   Due Date : {task['due_date']}")
        print(f"   Status   : {status}\n")


def mark_completed(tasks):
    view_tasks(tasks)

    try:
        index = int(input("Enter task number to mark completed: ")) - 1

        if 0 <= index < len(tasks):
            tasks[index]["completed"] = True
            print("Task marked as completed!\n")
        else:
            print("Invalid task number.\n")

    except:
        print("Please enter a valid number.\n")


def delete_task(tasks):
    view_tasks(tasks)

    try:
        index = int(input("Enter task number to delete: ")) - 1

        if 0 <= index < len(tasks):
            removed = tasks.pop(index)
            print(f"Deleted task: {removed['title']}\n")
        else:
            print("Invalid task number.\n")

    except:
        print("Please enter a valid number.\n")


def show_summary(tasks):
    pending = 0
    completed = 0

    for task in tasks:
        if task["completed"]:
            completed += 1
        else:
            pending += 1

    print("\n--- TASK SUMMARY ---")
    print(f"Pending Tasks   : {pending}")
    print(f"Completed Tasks : {completed}\n")


def main():
    tasks = load_tasks()

    while True:
        print("===== SMART TO-DO LIST PRO =====")
        print("1. Add Task")
        print("2. View Tasks")
        print("3. Mark Task Completed")
        print("4. Delete Task")
        print("5. Show Summary")
        print("6. Save Tasks")
        print("7. Exit")

        choice = input("Enter choice: ")

        if choice == "1":
            add_task(tasks)

        elif choice == "2":
            view_tasks(tasks)

        elif choice == "3":
            mark_completed(tasks)

        elif choice == "4":
            delete_task(tasks)

        elif choice == "5":
            show_summary(tasks)

        elif choice == "6":
            save_tasks(tasks)
            print("Tasks saved successfully!\n")

        elif choice == "7":
            save_tasks(tasks)
            print("Goodbye!")
            break

        else:
            print("Invalid choice. Try again.\n")


if __name__ == "__main__":
    main()
```

---

# Expense Tracker Plus

```python
import csv
from collections import defaultdict
from datetime import datetime

FILE_NAME = "expenses.csv"

expenses = []


def add_expense():
    amount = float(input("Enter amount: "))
    category = input("Enter category: ")
    date = input("Enter date (YYYY-MM-DD): ")

    expense = {
        "amount": amount,
        "category": category,
        "date": date
    }

    expenses.append(expense)

    print("Expense added successfully!\n")



def show_total():
    total = sum(expense["amount"] for expense in expenses)

    print(f"\nTotal Expenses: ₹{total}\n")



def category_summary():
    summary = defaultdict(float)

    for expense in expenses:
        summary[expense["category"]] += expense["amount"]

    print("\n--- CATEGORY SUMMARY ---")

    for category, amount in summary.ite
```
