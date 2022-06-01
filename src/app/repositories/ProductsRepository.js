const ProductModel = require('../models/product');

class ProductsRepository {
  async findAll() {
    const products = await ProductModel.find({});
    console.log({ products });
    return products;
  }

  async create({ name, category, unitPrice, amount, imageURL }) {
    const newProduct = new ProductModel({
      name,
      category,
      unitPrice,
      amount,
      imageURL,
    });

    const product = await newProduct.save();
    return product;
  }

  async delete(productId) {
    await ProductModel.deleteOne({ _id: productId });
  }

  async findByName(name) {
    const product = await ProductModel.find({ name });
    return product;
  }

  async findByNameAndId({ name, id }) {
    const hasProduct = await ProductModel.find().nor({ name, _id: id });
    console.log({ hasProduct });
  }

  async update({ id, name, category, unitPrice, amount, imageURL }) {
    const oldProduct = await ProductModel.findOne({ _id: id });

    oldProduct.overwrite({
      name,
      category,
      unitPrice,
      amount,
      imageURL,
    });

    const updatedProduct = await oldProduct.save();
    return updatedProduct;
  }
}

module.exports = new ProductsRepository();