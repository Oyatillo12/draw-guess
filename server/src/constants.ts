// Enhanced word list with categories
export const wordCategories = {
  animals: ['cat', 'dog', 'elephant', 'giraffe', 'lion', 'tiger', 'bear', 'penguin', 'dolphin', 'butterfly', 'owl', 'rabbit', 'fox', 'wolf', 'deer', 'squirrel', 'mouse', 'rat', 'hamster', 'guinea pig'],
  objects: ['house', 'car', 'tree', 'sun', 'moon', 'star', 'book', 'phone', 'computer', 'chair', 'table', 'bed', 'lamp', 'clock', 'mirror', 'window', 'door', 'key', 'lock', 'umbrella'],
  food: ['pizza', 'hamburger', 'apple', 'banana', 'orange', 'strawberry', 'cake', 'ice cream', 'bread', 'cheese', 'milk', 'coffee', 'tea', 'water', 'juice', 'soup', 'salad', 'rice', 'pasta', 'chicken'],
  nature: ['flower', 'grass', 'mountain', 'ocean', 'river', 'lake', 'forest', 'beach', 'cloud', 'rain', 'snow', 'wind', 'fire', 'earth', 'sky', 'rainbow', 'thunder', 'lightning', 'storm', 'sunset'],
  activities: ['swimming', 'running', 'jumping', 'dancing', 'singing', 'reading', 'writing', 'painting', 'cooking', 'cleaning', 'shopping', 'driving', 'flying', 'walking', 'sleeping', 'eating', 'drinking', 'playing', 'working', 'studying']
};

export const allWords = Object.values(wordCategories).flat();
