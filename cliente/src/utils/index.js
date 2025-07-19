/* eslint-disable prettier/prettier */

export function ViewDollar(strt) {
    let USDollar = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "COP",
    });
  
    return USDollar.format(strt);
  }