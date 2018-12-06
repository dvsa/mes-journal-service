import 'reflect-metadata';

import { Container } from 'inversify';
import { JournalRetriever } from './service/JournalRetriever';
import { StaticJournalRetriever } from './service/StaticJournalRetriever';

export enum ServiceIdentifiers {
  JournalRetriever = 'JournalRetriever',
}

const container = new Container();
container.bind<JournalRetriever>(ServiceIdentifiers.JournalRetriever).to(StaticJournalRetriever);

export default container;