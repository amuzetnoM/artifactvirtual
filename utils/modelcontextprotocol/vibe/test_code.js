// Test code file for vibe music generation
function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0;
  let b = 1;
  let temp;
  
  for (let i = 2; i <= n; i++) {
    temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

// Generate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(calculateFibonacci(i));
}

console.log("Fibonacci sequence:", results);