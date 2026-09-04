export function generateRef(prefix) {
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${num}`;
}
