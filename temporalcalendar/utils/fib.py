def is_fibonacci(n):
    a, b = 0, 1
    while b < n:
        a, b = b, a + b
    return b == n

def get_fib_gap(n):
    a, b = 0, 1
    index = 1
    while b < n:
        a, b = b, a + b
        index += 1
    return (index - 1, index) if b != n else (index, index)