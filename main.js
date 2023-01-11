const mongoose = require("mongoose");
const { Field, Model, sort, filter, paginate, init } = require("./mongoose-model");

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
  //       data.next();
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
  //       if (data.value !== "hasan") {
  //         data.model.var7 = data.name;
  //       }
  //       data.next();
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

    firstName = new Field({ isRequire: true, type: String });
    lastName = new Field({ isRequire: true, type: String });
    // relatedTo = new Field({ type: Person });

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

  // const model = Person.create({
  //   firstName: "joe", lastName: "Gandomi", relatedTo: {
  //     firstName: "jack", lastName: "Gonjishke", relatedTo: {
  //       firstName: "jim", lastName: "karry"
  //     }
  //   }
  // });
  // const res = await model.save();
  // console.log(res.fullName);

  const result = await Person.getAllPersons();
  const { items: list, ...info } = result[0];
  console.log(info, list.map(item => item.firstName + " " + item.lastName));
});
