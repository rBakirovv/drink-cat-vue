export interface Drink {
  id: string
  name: string
  price: number
  image: string
}

export interface DrinkDetails extends Drink {
  description: string
}
