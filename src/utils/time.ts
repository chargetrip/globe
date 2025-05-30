export default function randMinMax(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
