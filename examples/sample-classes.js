class Watch {
  returnMemoOrCancelSale() {
    if (true) {
      for (let i = 0; i < 10; i++) {
        try {
          if (i > 5) {
            console.log('high');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  name() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    } else if (this.firstName) {
      return this.firstName;
    } else {
      return 'Unknown';
    }
  }

  unlinkMemoOrSale() {
    if (this.memo) {
      this.memo = null;
    }
    if (this.sale) {
      this.sale = null;
    }
  }

  messageTitle() {
    if (this.status === 'active') {
      return 'Active Watch';
    }
    return 'Inactive Watch';
  }
}

class Sale {
  setSaleItemsCountAndCalculateTotal() {
    let total = 0;
    if (this.items) {
      for (const item of this.items) {
        total += item.price;
        if (item.discount) {
          total -= item.discount;
        }
      }
    }
    this.total = total;
    return total;
  }

  saleItemsAttributes() {
    if (!this.attributes) {
      this.attributes = [];
    }
    return this.attributes;
  }

  calculatedPaymentTerm() {
    if (this.paymentTerm) {
      return this.paymentTerm;
    } else if (this.customer && this.customer.paymentTerm) {
      return this.customer.paymentTerm;
    } else {
      return 'net30';
    }
  }
}

function helperFunction() {
  if (true) {
    console.log('helper');
  }
}
