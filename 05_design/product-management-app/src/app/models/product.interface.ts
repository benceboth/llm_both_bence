export interface Product {
    id: number;
    name: string;
    price: number;
    description?: string;
    stock: number;
}

export interface CreateProductDTO {
    name: string;
    price: number;
    description?: string;
    stock: number;
}

export interface UpdateProductDTO extends CreateProductDTO {
    id: number;
}