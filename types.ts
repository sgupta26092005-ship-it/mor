export interface Product {
    name: string;
    price: string;
    sizes: string;
    material: string;
    imgSrc: string;
}

export type ModalProduct = Product | null;