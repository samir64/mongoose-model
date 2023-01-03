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
  def: ["test"],
  type: String,
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
</pre

#### Filter operators

* Key part:


|   No. |   Symbol  |   Operator                |   Sample                          |
|-------|-----------|---------------------------|-----------------------------------|
|   1   |   \|      |       Or                  |   {"firstName\|lastName": ...}    |
|   2   |    !      |       Not                 |   {"gender!": ...}                |
|   3   |    >      |       Greater             |   {"age>": ...}                   |
|   4   |    >=     |       Greater Or Equal    |   {"age>=": ...}                  |
|   5   |    >      |       Less                |   {"age<": ...}                   |
|   6   |    >=     |       Less Or Equal       |   {"age<=": ...}                  |


* Value part:


|   No. |   Symbol  |   Operator                |   Sample                          |
|-------|-----------|---------------------------|-----------------------------------|
|   1   |   \|      |       Or                  |   {...: "gonjishke\|gandomi"}     |


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
