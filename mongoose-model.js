// const mongoose = require("mongoose");
// let mongoose;
let model, Schema;

const mapFilterCondition = (key, condition = "=") => value => {
  const checkType = [
    { condition: /^\d+(\.)?\d+?$/, cast: parseFloat, type: "Number" },
    { condition: /^\d+\-\d+\-\d+$/, cast: value => new Date(value), type: "Date" },
    { condition: /^\d+\-\d+\-\d+T\d+\:\d+(\:\d+(\.\d+)?)?Z?$/, cast: value => new Date(value), type: "DateTime" },
    { condition: /^true|false$/, cast: value => value == "true", type: "Boolean" },
    { condition: /.*/, cast: value => value, type: "String" },
  ];

  let result;
  let valueType;
  checkType.forEach(ct => {
    if (!result) {
      if (ct.condition.test(value)) {
        result = ct.cast(value);
        valueType = ct.type
      }
    }
  });

  switch (condition) {
    case "=":
      if (valueType === "String") {
        return { [key]: new RegExp(`.*${value}.*`, "i") };
      } else {
        return { [key]: value };
      }
      break;

    case "!":
      return {
        $expr: {
          $ne: ["$" + key, value]
        }
      };
      break;

    case "<":
      return {
        $expr: {
          $lt: ["$" + key, value]
        }
      };
      break;

    case ">":
      return {
        $expr: {
          $gt: ["$" + key, value]
        }
      };
      break;

    case "<=":
      return {
        $expr: {
          $lte: ["$" + key, value]
        }
      };
      break;

    case ">=":
      return {
        $expr: {
          $gte: ["$" + key, value]
        }
      };
      break;
  }
};

const limit_offset = (aggregate, itemIndex, page, fields, pageSize) => {
  page = page ?? 0;
  pageSize = !!pageSize ? parseInt(pageSize) : parseInt(process.env.PAGE_SIZE);
  const skip = (page ?? 0) * pageSize;

  fields.forEach(field => {
    aggregate.append({
      $addFields: {
        [field + "_pagination_result"]: {
          items: {
            $slice: [`$${field}`, skip, pageSize],
          },
          count: {
            $size: `$${field}`
          },
          page,
          pageSize,
          pageCount: {
            $ceil: {
              $divide: [
                { $size: `$${field}` },
                pageSize
              ]
            }
          }
        }
      }
    });

    aggregate.append({
      $project: {
        [field]: 0,
      }
    });

    aggregate.append({
      $addFields: {
        [field]: `$${field}_pagination_result`,
      }
    });

    aggregate.append({
      $project: {
        [field + "_pagination_result"]: 0,
      }
    });
  });
};

module.exports.Field = class {
  #type = Schema.Types.Mixed;
  #isRequire = false;
  #isArray = false;
  #def;
  #value;
  #check = data => data.next();

  constructor({ isRequire, def, type, isArray, check } = {}) {
    if (![String, Number, Boolean, Date, Schema.Types.ObjectId, Object].includes(type) && !!type && !(type.prototype instanceof module.exports.Model)) {
      throw "type_error";
    }

    if (isRequire !== undefined) {
      this.#isRequire = isRequire;
    }

    if (def !== undefined) {
      this.#def = def;
    }

    if (type !== undefined) {
      this.#type = type;
    }

    if (isArray !== undefined) {
      this.#isArray = isArray;
    }

    if ((check !== undefined) && (typeof check === "function")) {
      this.#check = check;
    }
  }

  get type() {
    return this.#type;
  }

  get isRequire() {
    return this.#isRequire;
  }

  get def() {
    return this.#def;
  }

  get isArray() {
    return this.#isArray;
  }

  get value() {
    return (this.#value === undefined) ? this.#def : this.#value;
  }

  set value(value) {
    this.#value = (value === undefined) ? this.#def : value;
  }

  get check() {
    return this.#check;
  }
}

module.exports.Model = class {
  static get modelName() { };
  static #models = {};
  static #modelFields = [];

  static #getModelFields(model) {
    return module.exports.Model.#modelFields.find(mf => mf.type === type)?.fields;
  }

  static create(fields) {
    if (!!this.modelName) {
      const Model = this.make();
      return new Model(fields);
    } else {
      return fields;
    }
  }

  static make() {
    let thisFields = {};

    const getFields = obj => {
      let fields = module.exports.Model.#getModelFields(this);

      if (!!fields) {
        return fields;
      } else {
        fields = {};
      }

      const props = Object.getOwnPropertyDescriptors(obj);
      Object.entries(props).forEach(([key, prop]) => {
        const field = prop?.value;
        if (field instanceof module.exports.Field) {
          if (field.type.prototype instanceof module.exports.Model) {
            const instance = new field.type();
            fields[key] = getFields(instance);
          } else {
            const type = field.type === Object ? Schema.Types.Mixed : field.type;
            fields[key] = {
              type: field.isArray ? [type] : type,
              default: field.def,
              required: field.isRequire,
              check: field.check,
            };
          }
        }
      });

      module.exports.Model.#modelFields.push({
        type: this,
        fields,
      });

      return fields;
    }

    const checkFields = (schema, fields, root = "") => {
      Object.entries(fields).forEach(([fieldName, field]) => {
        let fn = root;
        if (!!fn) {
          fn += ".";
        }
        fn += fieldName;

        if (!field.check) {
          checkFields(schema, field, fn);
        } else {
          schema.pre("validate", function (next) {
            const check = field.check.bind(this);
            let value = fn.split(".").reduce((res, cur) => res[cur], this);
            check({ model: this, value, next, name: fn });
          });
        }
      });
    }

    const load = () => {
      thisFields = getFields(new this());

      const schema = new Schema(thisFields, { timestamps: true });

      checkFields(schema, thisFields);

      schema.loadClass(this);

      if (!!this.modelName && !module.exports.Model.#models[this.modelName]) {
        module.exports.Model.#models[this.modelName] = model(this.modelName, schema);
      }

      if (!!this.modelName) {
        return module.exports.Model.#models[this.modelName];
      } else {
        return schema;
      }
    }

    return load();
  }

  static get collection() {
    if (!!this.modelName) {
      return module.exports.Model.#models[this.modelName] ?? this.make();
    }
  }
}

module.exports.sort = (aggregate, sort) => {
  if (!!sort) {
    if (sort[0] === "-") {
      sort = { [sort.substring(1)]: -1 };
    } else {
      sort = { [sort]: 1 };
    }

    aggregate.append({ $sort: sort });
  }

  return aggregate;
};

module.exports.filter = (aggregate, filters = {}) => {
  const andFilters = [];

  Object.entries((filters ?? {})).forEach(([key, value]) => {
    const keys = key.split("|");
    const values = value.toString().split("|");

    andFilters.push({
      $or: [...keys.reduce((res, cur) => {
        let condition = "=";
        if (cur.endsWith("!")) {
          cur = cur.substring(0, cur.length - 1);
          condition = "!";
        } else if (cur.endsWith("<")) {
          cur = cur.substring(0, cur.length - 1);
          condition = "<";
        } else if (cur.endsWith("<=")) {
          cur = cur.substring(0, cur.length - 2);
          condition = "<=";
        } else if (cur.endsWith(">")) {
          cur = cur.substring(0, cur.length - 1);
          condition = ">";
        } else if (cur.endsWith(">=")) {
          cur = cur.substring(0, cur.length - 2);
          condition = ">=";
        }

        return [
          ...res,
          ...((condition === "!") ?
            { $and: values.map(mapFilterCondition(cur, condition)) }
            :
            values.map(mapFilterCondition(cur, condition))),
        ]
      }, [])]
    });
  });

  if (andFilters.length > 0) {
    aggregate.append({
      $match: {
        $and: andFilters
      }
    });
  }

  return aggregate;
};

module.exports.paginate = (aggregate, page = 0, pageSize = 25) => {
  aggregate.append({
    $group: {
      _id: "",
      result: {
        $push: "$$CURRENT",
      },
    }
  });

  limit_offset(aggregate, 0, page, ["result"], pageSize);

  aggregate.append({
    $replaceRoot: {
      newRoot: "$result"
    }
  });

  // const result = await aggregate.exec();

  // return result[0] ?? {
  //   count: 0,
  //   page: 0,
  //   pageSize,
  //   pageCount: 0,
  //   count: 0,
  //   items: [],
  // };
  return aggregate;
};

module.exports.init = mngs => {
  // mongoose = mngs;
  model = mngs.model;
  Schema = mngs.Schema;
};