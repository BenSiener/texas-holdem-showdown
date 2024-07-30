export class Player {
    constructor(name, money) {
      this.name = name;
      this.money = money;
      this.hand = [];
    }
  
    bet(amount) {
      this.money -= amount;
      return amount;
    }
  
    win(amount) {
      this.money += amount;
    }
  }
  