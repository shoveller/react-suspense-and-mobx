import React, { Timeout } from "react";
import ReactDOM from "react-dom";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react";

class Dog {
  id = Math.random();
  @observable dog;

  promise = new Promise((resolve, reject) =>
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          this.dog = data;
          resolve();
        }, 2000);
      }, reject)
  );

  @computed
  get url() {
    if (this.dog) return this.dog.message;
    else throw this.promise;
  }
}

class MobxStore {
  @observable dogs = [];

  @action.bound
  add() {
    this.dogs.push(new Dog());
  }
}

const DogView = observer(({ dog }) => <img src={dog.url} height="200px" />);

const Dogs = observer(({ dogs }) => (
  <ul>
    {dogs.map(dog => (
      <Loader key={dog.id} ms={1000} fallback={<span>Cats are better</span>}>
        <DogView dog={dog} />
      </Loader>
    ))}
  </ul>
));

@observer
class App extends React.Component {
  render() {
    const { dogs } = this.props.store;
    return (
      <div>
        <button onClick={store.add}>Add</button>
        {dogs.length} dogs
        <hr />
        {/* BUG: with the following line ENABLED, the length above won't update immediately...*/}
        {/* for details: https://twitter.com/mweststrate/status/1030479604656553984 */}
        <Dogs dogs={dogs} />
      </div>
    );
  }
}

const store = new MobxStore();

// Copied from: https://codesandbox.io/s/8nq4w3jj39
const Loader = props => {
  return (
    <Timeout ms={props.ms}>
      {didTimeout => {
        console.log(
          props.ms,
          new Date().getTime(),
          "in Loader > Timeout, did timeout: ",
          didTimeout
        );
        /**
         * The first time this component is rendered, `didTimeout` will
         * be set to false, in order to init loading the component, which
         * will start the async - long - operation.
         *
         * On subsequent renderers it will be called with:
         *
         * - true, once the timeout expired - in order to show the provided
         *   placeholder
         * - false, once the Promise thrown by the component actually resolved
         *   to show the component
         */
        return didTimeout ? props.fallback : props.children;
      }}
    </Timeout>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App store={store} />);
