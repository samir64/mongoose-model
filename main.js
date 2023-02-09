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
  //   var4 = new Field({ type: String, default: "var4-val" });
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
  //     type: String, default: "var6-val", check: data => {
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
      default: "MALE",
      keys: ["MALE", "FEMALE"],
      type: { MALE: "MALE", FEMALE: "FEMALE" },
      multi: false
    });

    type = new Enum({
      multi: true,
      keys: ["EMPLOYEE", "EMPLOYER"]
    })

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
        if (!!model.isNew) {
          model.cnt = lastCnt.cnt + 1;
        }
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
        "firstName|lastName": "san|chal",
      });
      paginate(agrPerson, 0, 10);
      return agrPerson.exec();
    }
  }

  class Worker extends Person {
    constructor() {
      super();

    }

    job = new Field({
      isRequire: true,
      type: String,
    });

    get jobType() {
      return Worker;
    };

    check(next) {
      if (!this.typeCheck("EMPLOYEE")) {
        this.type.push("EMPLOYEE");
      }

      next();
    }
  }

  // const model = Person.create({
  //   firstName: "joe", lastName: "Gandomi", relatedTo: {
  //     firstName: "jack", lastName: "Gonjishke", relatedTo: {
  //       firstName: "jim", lastName: "karry"
  //     }
  //   }
  // });
  // const model = Worker.create({
  //   firstName: "hasan",
  //   lastName: "kachal",
  //   job: "kilid saaz",
  //   gender: "MALE",
  //   // type: ["EMPLOYER"]
  // });
  // // const model = await Worker.collection.findOne({ cnt: 4 });
  // const res = await model.save();
  // console.log(res.fullName, res.jobType);

  // console.log("Gender Value:", res.gender);
  // console.log("Gender Has Key 'FEMALE':", res.genderHasKey("FEMALE"));
  // console.log("Gender Check 'FEMALE': ", res.genderCheck("FEMALE"));
  // console.log("Gender Compare 'FEMALE': ", res.genderCompare("FEMALE"));

  // const result = await Person.getAllPersons();
  // const { items: list, ...info } = result?.[0] ?? { items: [] };
  // console.log(info, list.map(item => item.firstName + " " + item.lastName));







  const EEngine = Object.freeze({
    ELECTRIC: "ELECTRIC",
    GAS: "GAS",
    GASOLINE: "GASOLINE",
    HYBRID: "HYBRID",
  });

  class Vehicle extends Model {
    color = new Field({ isRequire: true, type: String });
    width = new Field({ isRequire: true, type: Number });
    length = new Field({ isRequire: true, type: Number });
    height = new Field({ isRequire: true, type: Number });
    engineType = new Enum({ type: EEngine });
  }

  class LandVehicleInfo extends Model {
    wheels = new Field({ isRequier: true, type: Number });
    doors = new Field({ isRequier: true, type: Number });
  }

  class WaterVehicleInfo extends Model {
    floors = new Field({ isRequire: true, type: Number });
    helipad = new Field({ default: false, type: Boolean });
  }

  class ElectricEngine extends Vehicle {
    batteryCapacity = new Field({ isRequire: true, type: Number });

    check(next) {
      this.engineType = EEngine.ELECTRIC;
      next();
    }
  }

  class GasEngine extends Vehicle {
    fuelCapacity = new Field({ isRequire: true, type: Number });

    check(next) {
      this.engineType = EEngine.GAS;
      next();
    }
  }

  class GasolineEngine extends Vehicle {
    fuelCapacity = new Field({ isRequire: true, type: Number });

    check(next) {
      this.engineType = EEngine.GASOLINE;
      next();
    }
  }

  class HybridEngine extends Vehicle {
    fuelCapacity = new Field({ isRequire: true, type: Number });
    batteryCapacity = new Field({ isRequire: true, type: Number });

    check(next) {
      this.engineType = EEngine.HYBRID;
      next();
    }
  }

  class ElectricBycicle extends ElectricEngine {
    static get modelName() {
      return "landVehicle";
    }

    vehicleInfo = new Field({ isRequire: true, type: LandVehicleInfo });
  }

  class SedanCar extends GasEngine {
    static get modelName() {
      return "landVehicle";
    }

    vehicleInfo = new Field({ isRequire: true, type: LandVehicleInfo });
  }

  class HybridVan extends HybridEngine {
    static get modelName() {
      return "landVehicle";
    }

    vehicleInfo = new Field({ isRequire: true, type: LandVehicleInfo });
  }

  class Truck extends GasolineEngine {
    static get modelName() {
      return "landVehicle";
    }

    vehicleInfo = new Field({ isRequire: true, type: LandVehicleInfo });
  }

  class Boat extends GasolineEngine {
    static get modelName() {
      return "waterVehicle";
    }

    vehicleInfo = new Field({ isRequire: true, type: WaterVehicleInfo });
  }

  const bycicle1 = ElectricBycicle.create({
    color: "white",
    width: 20,
    length: 100,
    height: 95,
    batteryCapacity: 100000,
    vehicleInfo: {
      wheels: 2,
      doors: 0,
    },
  });

  const boat1 = Boat.create({
    color: "red",
    width: 20,
    length: 100,
    height: 95,
    batteryCapacity: 100000,
    fuelCapacity: 200,
    vehicleInfo: {
      floors: 1,
      doors: 0,
    },
  });

  await bycicle1.save();
  await boat1.save();
});
