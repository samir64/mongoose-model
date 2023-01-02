# Mongoose.js model manager by javascript class

## Installation instruction:

`npm install mongoose-model`

## Use:

### Define field

```
const { Field } = require("mongoose-model");
let field1 = new Field({
  isRequire: true,
  isArray: true,
  def: ["test"],
  type: String,
});
```


### Define model as subdocument:

```
const { Model, Field } = require("mongoose-model");

class Person extends Model {
  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });
}
```


### Define model as collection

```
const { Model, Field } = require("mongoose-model");

class Person extends Model {
  static get modelName() {
    return "person";
  }

  firstName = new Field({ isRequire: true, type: String });
  lastName = new Field({ isRequire: true, type: String });
}
```


### Define virtual fields

```
const { Model, Field } = require("mongoose-model");

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
```


### Define collection methods

```
const { Model, Field } = require("mongoose-model");

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
```


### Create new document

```
const { Model, Field } = require("mongoose-model");

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

    paginate(agrPerson, 0 /* Page number */, 10 /* Page size */);
    return agrPerson.exec();
  }
}

Person.create({firstName: "jack", lastName: "gonjishke"});
Person.save().then(person => {
  console.log(person);
});
```


### Sort result (by aggregation)

```
const { Model, Field, sort } = require("mongoose-model");

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

    sort(agrPerson, "-lastName");
    return agrPerson.exec();
  }
}
```


### Filter result (by aggregation)

```
const { Model, Field, filter } = require("mongoose-model");

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
      lastName: "gonjishke"
    });
    return agrPerson.exec();
  }
}
```


### Complecated filters

```
const { Model, Field, filter } = require("mongoose-model");

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
      "firstName|lastName": "gonjishke|gandomi",
    });
    return agrPerson.exec();
  }
}
```

#### Filter operators

* Key part:

|   No. |   Symbol  |   Operator                |   Sample                          |
|-------|-----------|---------------------------|-----------------------------------|
|   1.  |  `\|`     |       Or                  |   {"firstName\|lastName": ...}    |
|   1.  |   `!`     |       Not                 |   {"gender!": ...}                |
|   1.  |   `>`     |       Greater             |   {"age>": ...}                   |
|   1.  |   `>=`    |       Greater Or Equal    |   {"age>=": ...}                  |
|   1.  |   `>`     |       Less                |   {"age<": ...}                   |
|   1.  |   `>=`    |       Less Or Equal       |   {"age<=": ...}                  |

* Value part:

|   No. |   Symbol  |   Operator                |   Sample                          |
|-------|-----------|---------------------------|-----------------------------------|
|   1.  |  `\|`     |       Or                  |   {...: "gonjishke\|gandomi"}     |

+ Mix:
```
{
  "firstName|lastName": "gonjishke|gandomi"
}
```


### Paginate result (by aggregation)

```
const { Model, Field, paginate } = require("mongoose-model");

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

    paginate(agrPerson, 0 /* Page number */, 10 /* Page size */);
    return agrPerson.exec();
  }
}
```
