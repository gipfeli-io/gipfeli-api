import { TourDto } from '../dto/tour';

export const tourDataMockForPaul: TourDto[] = [
  {
    id: '7eb9cfff-d76f-4421-9064-586cc0511a30',
    name: 'Lorem Ipsum ',
    startLocation: null,
    endLocation: null,
    description: 'Lorem Ipsum',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'test-id',
      firstName: 'Paul',
      lastName: 'Test',
      email: 'paul@gipfeli.io',
      password: 'redacted',
    },
  },
  {
    id: 'a815f336-1586-4857-a9cc-b521dac7d3c2',
    name: 'Lorem Ipsum ',
    startLocation: null,
    endLocation: null,
    description: 'description from nest',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'test-id',
      firstName: 'Paul',
      lastName: 'Test',
      email: 'paul@gipfeli.io',
      password: 'redacted',
    },
  },
];
export const tourDataMockForFranz: TourDto[] = [
  {
    id: '48d5f0d1-1f6a-4e63-8968-44f0718c979a',
    name: 'Lorem Ipsum',
    startLocation: null,
    endLocation: null,
    description: 'Lorem Ipsum',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '141ff2c7-e1c5-4f95-9569-4bae086e8e62',
      firstName: 'Franz',
      lastName: 'Mayer',
      email: 'franz@gipfeli.io',
      password: 'redacted',
    },
  },
];

export const tourDataMock = [...tourDataMockForFranz, ...tourDataMockForPaul];
