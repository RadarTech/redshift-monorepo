import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';

chai.use(chaiAsPromised);
chai.use(chaiShallowDeepEqual);

export const { expect } = chai;
