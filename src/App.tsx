import React from 'react';
import debounce from 'lodash.debounce';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';
import classNames from 'classnames';

export const Dropdown: React.FC<{
  people: Person[];
  onSelected: (person: Person) => void;
}> = ({ people, onSelected }) => {
  return (
    <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
      <div className="dropdown-content">
        {people.map(person => (
          <div
            key={person.slug}
            className="dropdown-item"
            data-cy="suggestion-item"
          >
            <p
              onClick={() => onSelected(person)}
              className={
                person.fatherName && person.motherName
                  ? 'has-text-link'
                  : 'has-text-danger'
              }
            >
              {person.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [isActive, setIsActive] = React.useState(false);
  const [people, setPeople] = React.useState(peopleFromServer);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(
    null,
  );

  const handleSearch = React.useCallback((searchValue: string) => {
    const filteredPeople = peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    if (filteredPeople.length === 0) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }

    setSelectedPerson(null);
    setPeople(filteredPeople);
  }, []);

  const debouncedSearch = React.useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch],
  );

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setIsActive(false);
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className={classNames('dropdown', { 'is-active': isActive })}>
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              onFocus={handleFocus}
              onChange={handleInputChange}
            />
          </div>

          <Dropdown people={people} onSelected={handleSelectPerson} />
        </div>

        {people.length === 0 && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
