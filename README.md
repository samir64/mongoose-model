# Mongoose.js model manager by javascript class

## Installation instruction:

`npm install mongoosejs-model`

## Use:

### Connect to databse
```
const mongoose = require("mongoose");

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
```

```
const { init } = require("mongoosejs-model");
init(require("mongoose"));
```

### Define field

```
const { Field } = require("mongoosejs-model");
let field1 = new Field({
  isRequire: true,
  isArray: true,
  default: ["test"],
  type: String,
});
```

### Define enum

```
const { Enum } = require("mongoosejs-model");
let field1 = new Enum({
  multi: false,
  default: "E1",
  keys: ["E1", "E2"],
});
```

OR

<pre>
const { Enum } = require("mongoosejs-model");
<b>const EConst1 = Object.freeze({
  E1: "E1",
  E2: "E2",
});</b>
let field1 = new Enum({
  multi: false,
  default: "E1",
  <b>type: EConst1</b>,
});
</pre>

```
const { Enum } = require("mongoosejs-model");
let field2 = new Enum({
  multi: true,
  default: ["E1"],
  keys: ["E1", "E2"],
});
```


### Define model as subdocument:

```
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });
}
```


### Model enum methods:

<pre>
const { Model, Field, Enum } = require("mongoosejs-model");

class Person extends Model {
  <b>gender = new Enum({ keys: ["MALE", "FEMALE"] });</b>
  <b>properties = new Enum({ keys: ["CAR", "HOUSE"], multi: true });</b>
  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });
}

<b>Person.create({ firstName: "hasan", lastName: "Kachal", gender: "MALE", properies: ["CAR", "HOUSE"] });</b>

<b>genderHasKey("MALE"); // Returns 'true'</b>
<b>genderHasKey("FEMALE"); // Returns 'true'</b>

<b>genderCheck("FEMALE"); // Returns 'false'</b>
<b>genderCheck("MALE"); // Returns 'true'</b>

<b>genderCompare("FEMALE"); // Returns 'false'</b>
<b>genderCompare("MALE"); // Returns 'true'</b>


<b>propertiesHasKey("CAR"); // Returns 'true'</b>
<b>propertiesHasKey("HOUSE"); // Returns 'true'</b>

<b>propertiesCheck("HOUSE"); // Returns 'true'</b>
<b>propertiesCheck("CAR"); // Returns 'true'</b>

<b>propertiesCompare("HOUSE"); // Returns 'false'</b>
<b>propertiesCompare("CAR"); // Returns 'false'</b>
<b>propertiesCompare("HOUSE", "CAR"); // Returns 'true'</b>
</pre>


### Define model as collection

<pre>
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  <b>static get modelName() {
    return "person";
  }</b>

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });
}
</pre>

### Inheritance models

<pre>
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

<b>const bycicle1 = ElectricBycicle.create({
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
  fuelCapacity: 200,
  vehicleInfo: {
    floors: 1,
    doors: 0,
  },
});

await bycicle1.save();
await boat1.save();</b>
</pre>


### Define virtual fields

<pre>
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  <b>get fullName() {
    return this.firstName + " " + this.lastName;
  }</b>
}
</pre>


### Use collection methods

<pre>
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }
}

<b>Person.collection.findOne({
  firstName: "jack",
  lastName: "gonjishke"
});</b>
</pre>


### Define collection methods

<pre>
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  <b>static getAllPersons() {
    return this.collection.find({});
  }</b>
}
</pre>


### Create new document

<pre>
const { Model, Field } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    return this.collection.find({});
  }
}

<b>Person.create({firstName: "jack", lastName: "gonjishke"});
Person.save().then(person => {
  console.log(person);
});</b>
</pre>


### Use aggregation in collection methods

<pre>
const { Model, Field, <b>sort</b> } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    <b>const agrPerson = this.collection.aggregate();
    agrPerson.append({$match: {
      firstName: "jack",
    }});
    
    return agrPerson.exec();</b>
  }
}
</pre>


### Sort result (by aggregation)

<pre>
const { Model, Field, <b>sort</b> } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    const agrPerson = this.collection.aggregate();

    <b>sort(agrPerson, "-lastName");</b>
    return agrPerson.exec();
  }
}
</pre>


### Filter result (by aggregation)

<pre>
const { Model, Field, filter } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    const agrPerson = this.collection.aggregate();

    <b>filter(agrPerson, {
      lastName: "gonjishke"
    });</b>
    return agrPerson.exec();
  }
}
</pre>


### Complecated filters

<pre>
const { Model, Field, filter } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    const agrPerson = this.collection.aggregate();

    filter(agrPerson, {
      <b>"firstName|lastName": "gonjishke|gandomi",</b>
    });
    return agrPerson.exec();
  }
}
</pre>

#### Filter operators

* Key part:


| No.   | Symbol    | Operator          | Sample                       |
| ----- | --------- | ----------------- | ---------------------------- |
| 1     | \|        | Or                | {"firstName\|lastName": ...} |
| 2     | !         | Not               | {"gender!": ...}             |
| 3     | >         | Greater           | {"age>": ...}                |
| 4     | >=        | Greater Or Equal  | {"age>=": ...}               |
| 5     | >         | Less              | {"age<": ...}                |
| 6     | >=        | Less Or Equal     | {"age<=": ...}               |


* Value part:


| No. | Symbol  | Operator   | Sample                       |
| --- | ------- | ---------- | ---------------------------- |
| 1   | \|      | Or         | {...: "gonjishke\|gandomi"}  |


+ Mix:
```
{
  "firstName|lastName": "gonjishke|gandomi"
}
```


### Paginate result (by aggregation)

<pre>
const { Model, Field, paginate } = require("mongoosejs-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  static getAllPersons() {
    const agrPerson = this.collection.aggregate();

    <b>paginate(agrPerson, 0 /* Page number */, 10 /* Page size */);</b>
    return agrPerson.exec();
  }
}
</pre>
