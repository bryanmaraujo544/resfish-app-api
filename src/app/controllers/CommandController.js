const CommandsRepository = require('../repositories/CommandsRepository');
const ProductsRepository = require('../repositories/ProductsRepository');
const { someIsEmpty } = require('../utils/someIsEmpty');

class CommandController {
  async index(req, res) {
    const commands = await CommandsRepository.findCurrentDayCommands();
    res.send(commands);
  }

  async store(req, res) {
    const { table, waiter, fishingType } = req.body;

    const hasFieldEmpty = someIsEmpty([table, waiter, fishingType]);
    if (hasFieldEmpty) {
      return res.status(400).json({
        message: 'Campos obrigatórios foram esquecidos.',
        product: null,
      });
    }

    // If one command that it's active has the same name, we throw an error
    const tableExists = await CommandsRepository.findByTable({ table });
    if (tableExists) {
      return res.status(400).json({
        message: 'O nome da mesa já está em uso.',
        product: null,
      });
    }

    const products = [];

    if (fishingType.toLowerCase() === 'pesca esportiva') {
      const [{ _id, name, imageURL, category, unitPrice }] =
        await ProductsRepository.findByName('Pesca Esportiva');
      products.push({ _id, name, imageURL, category, unitPrice, amount: 1 });
    }

    if (fishingType.toLowerCase() === 'pesque pague') {
      const [{ _id, name, imageURL, category, unitPrice }] =
        await ProductsRepository.findByName('Pesque Pague');
      products.push({ _id, name, imageURL, category, unitPrice, amount: 1 });
    }

    const commandTotal = products
      ?.reduce(
        (amount, current) => amount + current.amount * current.unitPrice,
        0
      )
      .toFixed(2);

    const newCommand = await CommandsRepository.create({
      table,
      waiter,
      fishingType,
      products,
      total: Number(commandTotal) || 0,
    });
    return res.json({ message: 'Comanda adicionada', command: newCommand });
  }

  async update(req, res) {
    const { id } = req.params;
    const { table, waiter, fishingType, isActive, products } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: 'ID é necessário. ', command: null });
    }

    const commandToUpdate = await CommandsRepository.findById(id);
    if (!commandToUpdate) {
      return res
        .status(400)
        .json({ message: 'Esta comanda não existe', command: null });
    }

    const tableExists = await CommandsRepository.findByTable({ table });
    if (tableExists && tableExists._id.valueOf() !== id) {
      return res
        .status(400)
        .json({ message: 'Já existe uma mesa com este nome', command: null });
    }

    // TODO: verify the amount of products added in stock

    const commandTotal = products?.reduce(
      (amount, current) => amount + current.amount * current.unitPrice,
      0
    );

    // If any products were sended this variable will be undefined
    // so the total of the command will not be changed
    const commandTotalFormatted =
      commandTotal && Number(commandTotal).toFixed(2);

    // If any products were sended this variable will be undefined
    // so the payed total of the command will not be changed
    const commandPayedTotal = products?.reduce(
      (amount, current) => amount + Number(current.totalPayed),
      0
    );
    const commandPayedTotalFormatted =
      commandPayedTotal && Number(commandPayedTotal).toFixed(2);

    if (commandPayedTotalFormatted > commandToUpdate.total) {
      return res
        .status(400)
        .json({ message: 'Valor pago maior que o necessário', command: null });
    }

    // DIMINISH THE AMOUNT OF PRODUCTS ADDED IN STOCK
    // TODO: I need to grab the new products added and the difference between the amount of old to new.

    const updatedCommand = await CommandsRepository.update({
      _id: id,
      table,
      waiter,
      fishingType,
      total: commandTotalFormatted,
      isActive,
      products,
      totalPayed: commandPayedTotalFormatted,
    });

    if (updatedCommand === null) {
      return res.status(500).json({ message: 'Erro Interno', command: null });
    }

    res.json({ message: 'Comanda atualizada', command: updatedCommand });
  }

  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'O ID da comanda precisa ser informado para sua deleção.',
      });
    }

    await CommandsRepository.delete(id);
    res.status(200).json({ message: 'Comanda deletada' });
  }

  async show(req, res) {
    const { id } = req.params;

    const command = await CommandsRepository.findById(id);

    if (!command) {
      return res
        .status(404)
        .json({ message: 'Comanda não encontrada', command: null });
    }

    return res.json({ message: 'Comanda encontrada ', command });
  }
}

module.exports = new CommandController();
