import time
import sys

time.sleep(1)
print("This is line 1")
time.sleep(1)
print("This is line 2")
time.sleep(1)
sys.stdin.seek(2)
answer = input("This is a question")
print(answer)