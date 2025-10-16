class ProductModel {
  validateComplex() {
    if (this.price) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].invalid) {
          throw new Error('Invalid item');
        }
      }
    }
  }
  
  getName() {
    if (this.name) {
      return this.name;
    }
    return 'Unknown';
  }
  
  getPrice() {
    return this.price;
  }
  
  setActive() {
    this.active = true;
  }
  
  getId() {
    return this.id;
  }
}

class SimpleModel {
  getValue() {
    return this.value;
  }
  
  setValue(v) {
    this.value = v;
  }
  
  isEmpty() {
    return !this.value;
  }
}
