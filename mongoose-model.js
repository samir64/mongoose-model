// const mongoose = require("mongoose");
// let mongoose;
const pluralize = require("pluralize");
const caseConverter = require("js-convert-case");
const md5 = require("md5");
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
  #isUnique = false;
  #isArray = false;
  #def;
  #value;
  // #check = next => next();
  #check;

  constructor({ isRequire, isUnique, def, type, isArray, check } = {}) {
    if (![String, Number, Boolean, Date, Schema.Types.ObjectId, Object].includes(type) && !!type && !(type.prototype instanceof module.exports.Model)) {
      throw "type_error";
    }

    if (isRequire !== undefined) {
      this.#isRequire = isRequire;
    }

    if (isUnique !== undefined) {
      this.#isUnique = isUnique;
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

  get isUnique() {
    return this.#isUnique;
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

  static #getModelFields(id) {
    return module.exports.Model.#modelFields.find(mf => mf.id === id)?.fields;
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

    const getFields = (obj, schema) => {
      let fields = module.exports.Model.#getModelFields(md5(JSON.stringify(obj)));

      if (!!fields) {
        return fields;
      } else {
        fields = {};

        module.exports.Model.#modelFields.push({
          id: md5(JSON.stringify(obj)),
          schema,
          fields,
        });
      }

      const props = Object.getOwnPropertyDescriptors(obj);
      Object.entries(props).forEach(([key, prop]) => {
        const field = prop?.value;
        if (field instanceof module.exports.Field) {
          if (field.type.prototype instanceof module.exports.Model) {
            const instance = new field.type();
            const fieldSchema = new Schema({}, { timestamps: true });
            thisFields = getFields(instance, fieldSchema);

            fieldSchema.add(thisFields);

            fields[key] = {
              type: field.isArray ? [fieldSchema] : fieldSchema,
              default: field.def,
              required: field.isRequire,
              unique: field.isUnique,
              check: field.check,
            };
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
          // checkFields(schema, field, fn);
        } else {
          schema.pre("validate", function (next) {
            const check = field.check.bind(this);
            let value = fn.split(".").reduce((res, cur) => res[cur], this.toJSON());
            // check({ model: this, value, next, name: fn });
            check(next, fn, value, this);
          });
        }
      });
    }

    const load = () => {
      const schema = new Schema({}, { timestamps: true });
      thisFields = getFields(new this(), schema);

      schema.add(thisFields);

      checkFields(schema, thisFields);

      schema.loadClass(this);

      if (!!this.modelName && !module.exports.Model.#models[this.modelName]) {
        module.exports.Model.#models[this.modelName] = model(caseConverter.toKebabCase(pluralize(this.modelName)), schema);
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