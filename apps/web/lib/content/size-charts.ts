export interface SizeRow {
  size: string
  chest: number
  waist: number
  hip: number
  length: number
}

export interface SizeChart {
  rows: SizeRow[]
  fabricGuide: { name: string; twopiece: string; threepiece: string }[]
}

export const WOMEN_SIZES: SizeChart = {
  rows: [
    { size: 'XS',  chest: 32, waist: 26, hip: 35, length: 38 },
    { size: 'S',   chest: 34, waist: 28, hip: 37, length: 39 },
    { size: 'M',   chest: 36, waist: 30, hip: 39, length: 40 },
    { size: 'L',   chest: 38, waist: 32, hip: 41, length: 41 },
    { size: 'XL',  chest: 40, waist: 34, hip: 43, length: 42 },
    { size: 'XXL', chest: 42, waist: 36, hip: 45, length: 43 },
  ],
  fabricGuide: [
    { name: '2-Piece', twopiece: '5.5 metres', threepiece: '' },
    { name: '3-Piece', twopiece: '', threepiece: '7 metres' },
  ],
}

export const MEN_SIZES: SizeChart = {
  rows: [
    { size: 'S',   chest: 38, waist: 32, hip: 39, length: 42 },
    { size: 'M',   chest: 40, waist: 34, hip: 41, length: 43 },
    { size: 'L',   chest: 42, waist: 36, hip: 43, length: 44 },
    { size: 'XL',  chest: 44, waist: 38, hip: 45, length: 45 },
    { size: 'XXL', chest: 46, waist: 40, hip: 47, length: 46 },
  ],
  fabricGuide: [
    { name: 'Kurta (plain)', twopiece: '3 metres', threepiece: '' },
    { name: 'Shalwar',       twopiece: '2.5 metres', threepiece: '' },
    { name: 'Suit (3pc)',    twopiece: '', threepiece: '6 metres' },
  ],
}

export const KIDS_SIZES: SizeChart = {
  rows: [
    { size: '2-3Y',   chest: 22, waist: 21, hip: 24, length: 22 },
    { size: '4-5Y',   chest: 24, waist: 22, hip: 26, length: 25 },
    { size: '6-7Y',   chest: 26, waist: 23, hip: 28, length: 28 },
    { size: '8-9Y',   chest: 28, waist: 24, hip: 30, length: 31 },
    { size: '10-11Y', chest: 30, waist: 25, hip: 32, length: 34 },
    { size: '12-13Y', chest: 32, waist: 26, hip: 34, length: 37 },
  ],
  fabricGuide: [
    { name: 'Suit (2pc)', twopiece: '3 metres', threepiece: '' },
    { name: 'Suit (3pc)', twopiece: '', threepiece: '4.5 metres' },
  ],
}
