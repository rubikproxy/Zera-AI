export interface EpdsQuestion {
  text: string;
  options: string[];
}

export const epdsQuestions: EpdsQuestion[] = [
  {
    text: 'I have been able to laugh and see the funny side of things.',
    options: [
      'As much as I always could',
      'Not quite as much now',
      'Definitely not as much now',
      'Not at all',
    ],
  },
  {
    text: 'I have looked forward with enjoyment to things.',
    options: [
      'As much as I ever did',
      'Rather less than I used to',
      'Definitely less than I used to',
      'Hardly at all',
    ],
  },
  {
    text: 'I have blamed myself unnecessarily when things went wrong.',
    options: [
      'Yes, most of the time',
      'Yes, some of the time',
      'Not very often',
      'No, never',
    ],
  },
  {
    text: 'I have been anxious or worried for no good reason.',
    options: [
      'No, not at all', 
      'Hardly ever', 
      'Yes, sometimes', 
      'Yes, very often'
    ],
  },
  {
    text: 'I have felt scared or panicky for no very good reason.',
    options: [
      'Yes, quite a lot',
      'Yes, sometimes',
      'No, not much',
      'No, not at all',
    ],
  },
  {
    text: 'Things have been getting on top of me.',
    options: [
      'Yes, most of the time I haven’t been able to cope at all',
      'Yes, sometimes I haven’t been coping as well as usual',
      'No, most of the time I have coped quite well',
      'No, I have been coping as well as ever',
    ],
  },
  {
    text: 'I have been so unhappy that I have had difficulty sleeping.',
    options: [
      'Yes, most of the time',
      'Yes, sometimes',
      'Not very often',
      'No, not at all',
    ],
  },
  {
    text: 'I have felt sad or miserable.',
    options: [
      'Yes, most of the time',
      'Yes, quite often',
      'Not very often',
      'No, not at all',
    ],
  },
  {
    text: 'I have been so unhappy that I have been crying.',
    options: [
      'Yes, most of the time',
      'Yes, quite often',
      'Only occasionally',
      'No, never',
    ],
  },
  {
    text: 'The thought of harming myself has occurred to me.',
    options: [
      'Yes, quite often',
      'Sometimes',
      'Hardly ever',
      'Never',
    ],
  },
];
