declare namespace Chai {
  interface Assertion {
    calledWith(...args: any[]): Assertion;
    calledWithExactly(...args: any[]): Assertion;
    called: Assertion;
    calledOnce: Assertion;
    calledTwice: Assertion;
    calledThrice: Assertion;
    callCount(count: number): Assertion;
  }
}