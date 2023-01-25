const mongoose = require("mongoose");
const { Model, Field, Enum, sort, filter, paginate, init } = require("./mongoose-model");

const uri = "mongodb://mdb/test";

init(mongoose);

const startDatabase = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(uri)
      .then(() => {
        console.log("💪 connected to DB.");
        resolve();
      })
      .catch(err => {
        console.log("DB connection error:", err);
        startDatabase();
        reject(err);
      });
  });
};

startDatabase().then(async () => {
  // class Model1 extends Model {
  //   var4 = new Field({ type: String, def: "var4-val" });
  //   var5 = new Field({ type: Number, isArray: true });

  //   #var1 = "123";
  //   get var1() {
  //     return this.#var1;
  //   }

  //   set var1(value) {
  //     this.#var1 = value;
  //   }

  //   var2 = "a";

  //   var3() {
  //     return "Hi";
  //   }
  // }

  // class Model2 extends Model1 {
  //   static get modelName() {
  //     return "abc";
  //   }

  //   var6 = new Field({
  //     type: String, def: "var6-val", check: data => {
  //       console.log("Check for sub document's field", data);
  //       next();
  //     }
  //   });

  //   get test() {
  //     return "Model2-Test";
  //   }
  // }

  // class Model3 extends Model {
  //   static get modelName() {
  //     return "model3";
  //   }

  //   var7 = new Field({
  //     type: String, check: data => {
  //       console.log(data);
  //       if (value !== "hasan") {
  //         model.var7 = name;
  //       }
  //       next();
  //     }
  //   });

  //   var8 = new Field({ type: Model2 })

  //   get test() {
  //     console.log(this);
  //     return "Model3-Test";
  //   }

  //   static async getAllModel3s(page, pageSize, filters, sortField) {
  //     const agrModel3 = this.collection.aggregate();

  //     agrModel3.append({ $unwind: "$var8.var5" });
  //     sort(agrModel3, sortField);
  //     filter(agrModel3, filters);
  //     paginate(agrModel3, page, pageSize);
  //     return await agrModel3.exec();
  //   }
  // }

  // Model2.collection.find({}).then(console.log);

  // const model3 = Model3.create({ var7: "machal", var8: { var6: "jim", var5: 123 } });
  // model3.save().then(model => {
  //   console.log(model);
  //   console.log(model.test);
  //   Model3.getAllModel3s(0, 10, { "var8.var6": "joe" }, "createdAt").then(console.log);
  // });
  // const model2 = Model2.create({ var6: "joe", var5: 321 });

  // model2.save();
  // console.log(model2.test);

  class Person extends Model {
    static get modelName() {
      return "person";
    }

    gender = new Enum({
      def: ["MALE", "FEMALE"],
      keys: ["MALE", "FEMALE"],
      multi: true
    });

    firstName = new Field({
      isRequire: true,
      type: String,
      check: (next, path, value, model) => {
        model.lastName += (value === "jack") ? "*" : "|";
        next();
      }
    });
    lastName = new Field({ isRequire: true, type: String });
    relatedTo = new Field({ type: Person });
    cnt = new Field({
      type: Number,
      isRequire: true,
      isUnique: true,
      check: async (next, path, value, model) => {
        const lastCnt = await Person.collection.findOne({}, { cnt: 1 }, { sort: { cnt: -1 } }) ?? { cnt: 0 };
        console.log(path, value, lastCnt.cnt);
        model.cnt = lastCnt.cnt + 1;
        next();
      },
    });

    get fullName() {
      return this.firstName + " " + this.lastName;
    }

    static getAllPersons() {
      const agrPerson = this.collection.aggregate();

      sort(agrPerson, "-lastName");
      filter(agrPerson, {
        "firstName|lastName": "Onj|and",
      });
      paginate(agrPerson, 0, 10);
      return agrPerson.exec();
    }
  }

  const model = Person.create({
    firstName: "joe", lastName: "Gandomi", relatedTo: {
      firstName: "jack", lastName: "Gonjishke", relatedTo: {
        firstName: "jim", lastName: "karry"
      }
    }
  });
  const res = await model.save();
  console.log(res.fullName);

  console.log("Gender Value:", res.gender);
  console.log("Gender Has Key 'FEMALE':", res.genderHasKey("FEMALE"));
  console.log("Gender Check 'FEMALE': ", res.genderCheck("FEMALE"));
  console.log("Gender Compare 'FEMALE': ", res.genderCompare("FEMALE"));

  const result = await Person.getAllPersons();
  const { items: list, ...info } = result[0];
  console.log(info, list.map(item => item.firstName + " " + item.lastName));
});
