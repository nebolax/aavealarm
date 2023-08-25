import traceback

def some_func():
    raise Exception("This is the error message.")

try:
    some_func()
except Exception as e:
    print(traceback.format_exc())
