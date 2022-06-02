/* eslint-disable no-unused-vars */
const CommandModel = require('../models/command');

class CommandRepository {
  async create({ table, waiter, fishingType }) {
    try {
      const newCommand = new CommandModel({
        table,
        waiter,
        fishingType,
      });

      const command = await newCommand.save();
      return command;
    } catch (error) {
      console.log(error?.message);
      return null;
    }
  }

  async update({ _id, table, waiter, fishingType, total, isActive, products }) {
    console.log({
      table,
      waiter,
      fishingType,
      total,
      isActive,
      products,
    });

    await CommandModel.updateOne(
      { _id },
      {
        $set: {
          table,
          waiter,
          fishingType,
          total,
          isActive,
          products,
        },
      }
    );

    const updatedCommand = await CommandModel.findOne({ _id });
    return updatedCommand;
  }

  async delete(commandId) {
    await CommandModel.deleteOne({ _id: commandId });
  }

  async findAll() {
    const commands = await CommandModel.find({});
    return commands;
  }

  async findByTable({ table }) {
    const command = await CommandModel.findOne({ table, isActive: true });
    return command;
  }

  async findById(id) {
    console.log(id);
    try {
      const command = await CommandModel.findOne({ _id: id });
      console.log(command);
      return command;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }
}

module.exports = new CommandRepository();
