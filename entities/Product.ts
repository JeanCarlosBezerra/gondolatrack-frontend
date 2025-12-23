// === INÍCIO ARQUIVO AJUSTADO: entities/Product.ts ===

export type Product = {
  id: number;
  name: string;
  ean: string;
  brand?: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tinta Coral 18L",
    ean: "7891234567890",
    brand: "Coral",
  },
  {
    id: 2,
    name: "Parafuso 10mm",
    ean: "7899876543210",
    brand: "Genérico",
  },
  {
    id: 3,
    name: "Verniz 3,6L",
    ean: "7891112223334",
    brand: "Suvinil",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ProductEntity {
  static async list(): Promise<Product[]> {
    await delay(200);
    return MOCK_PRODUCTS;
  }

  // Já deixa pronto pra quando estiver no DB2:
  static async findByEan(ean: string): Promise<Product | null> {
    await delay(150);

    const normalized = ean.replace(/\D/g, "");
    const product = MOCK_PRODUCTS.find(
      (p) => p.ean.replace(/\D/g, "") === normalized
    );

    return product ?? null;
  }
}

// === FIM ARQUIVO AJUSTADO: entities/Product.ts ===
