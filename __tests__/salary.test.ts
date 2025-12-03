import {
  calculateNetSalary,
  calculateTDS,
  calculateSalary,
} from "@/lib/salary-service";

describe("Salary calculations", () => {
  describe("calculateSalary", () => {
    it("calculates salary with string gross for India", () => {
      const result = calculateSalary("1000", "India");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("100.00");
      expect(result.net).toBe("900.00");
    });

    it("calculates salary with number gross for India", () => {
      const result = calculateSalary(1000, "India");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("100.00");
      expect(result.net).toBe("900.00");
    });

    it("calculates salary for USA with case-insensitive match", () => {
      const result = calculateSalary(1000, "USA");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("120.00");
      expect(result.net).toBe("880.00");
    });

    it("calculates salary for United States", () => {
      const result = calculateSalary(1000, "United States");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("120.00");
      expect(result.net).toBe("880.00");
    });

    it("calculates salary for US", () => {
      const result = calculateSalary(1000, "US");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("120.00");
      expect(result.net).toBe("880.00");
    });

    it("calculates salary with case-insensitive india", () => {
      const result = calculateSalary(1000, "INDIA");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("100.00");
      expect(result.net).toBe("900.00");
    });

    it("calculates salary for other countries with 0% TDS", () => {
      const result = calculateSalary(1000, "Spain");
      expect(result.gross).toBe("1000.00");
      expect(result.tds).toBe("0.00");
      expect(result.net).toBe("1000.00");
    });

    it("handles decimal salaries correctly", () => {
      const result = calculateSalary(1000.5, "India");
      expect(result.gross).toBe("1000.50");
      expect(result.tds).toBe("100.05");
      expect(result.net).toBe("900.45");
    });
  });

  describe("calculateTDS", () => {
    it("calculates TDS for India (10%)", () => {
      const tds = calculateTDS(1000, "India");
      expect(tds).toBe(100);
    });

    it("calculates TDS for USA (12%)", () => {
      const tds = calculateTDS(1000, "USA");
      expect(tds).toBe(120);
    });

    it("calculates TDS for United States (12%)", () => {
      const tds = calculateTDS(1000, "United States");
      expect(tds).toBe(120);
    });

    it("returns 0 TDS for other countries", () => {
      const tds = calculateTDS(1000, "Spain");
      expect(tds).toBe(0);
    });

    it("returns 0 TDS for UK", () => {
      const tds = calculateTDS(1000, "UK");
      expect(tds).toBe(0);
    });

    it("handles decimal salaries correctly for India", () => {
      const tds = calculateTDS(1000.5, "India");
      expect(tds).toBeCloseTo(100.05, 2);
    });

    it("handles decimal salaries correctly for USA", () => {
      const tds = calculateTDS(1000.5, "USA");
      expect(tds).toBeCloseTo(120.06, 2);
    });
  });

  describe("calculateNetSalary", () => {
    it("calculates net salary for India (10% TDS)", () => {
      const net = calculateNetSalary(1000, "India");
      expect(net).toBe(900);
    });

    it("calculates net salary for USA (12% TDS)", () => {
      const net = calculateNetSalary(1000, "USA");
      expect(net).toBe(880);
    });

    it("calculates net salary with no deduction for other countries", () => {
      const net = calculateNetSalary(1000, "Spain");
      expect(net).toBe(1000);
    });

    it("handles decimal salaries correctly", () => {
      const net = calculateNetSalary(50000.5, "India");
      expect(net).toBeCloseTo(45000.45, 2);
    });

    it("handles large salaries correctly", () => {
      const net = calculateNetSalary(100000, "USA");
      expect(net).toBe(88000);
    });
  });
});
