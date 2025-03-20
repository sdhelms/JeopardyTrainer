import React from 'react';

function CountryTable({ countries }) {
    return (
        <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Flag</th>
                    <th>Name</th>
                    <th>Capital</th>
                    <th>Region</th>
                    <th>Population</th>
                </tr>
            </thead>
            <tbody>
                {countries.map(country =>
                    <tr key={country.name}>
                        <td>
                            <img
                                src={country.flag}
                                alt={`Flag of ${country.name}`}
                                style={{ width: '50px', height: 'auto' }}
                            />
                        </td>
                        <td>{country.name}</td>
                        <td>{country.capital}</td>
                        <td>{country.region}</td>
                        <td>{country.population.toLocaleString()}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default CountryTable;