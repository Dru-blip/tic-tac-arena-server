export class Board {

  private cells: string[];
  constructor(public roomId: string) {
    this.cells = Array(9).fill(null);
  }

  setCell(position: number, symbol: string) {
    if (!this.cells[position]) {
      this.cells[position] = symbol;
    }
  }

  getCells(): string[] {
    return this.cells
  }

  reset() {
    this.cells=Array(9).fill(null)
  }
}
