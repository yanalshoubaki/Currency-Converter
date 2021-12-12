import React, { useEffect, useState } from "react";
import axios from "axios";
const Converter = () => {
  const API_KEY = "f7aad7c5b0fd77488f8b";
  // List of currencies and their ISO, fetched from fixer API
  const [currencies, setCurrencies] = useState([]);
  // Amount to be converted stored in state
  const [amount, setAmount] = useState(0);
  // The pair to be converted at any given moment, stored as two objects in state
  const [pair, setPair] = useState({});
  // Loader to be displayed before axios realises the fetch from the API's
  const [loaded, setLoaded] = useState(false);
  // The output from the conversion stored in state
  const [output, setOutput] = useState({});

  useEffect(() => {
    axios
      .get(`https://free.currconv.com/api/v7/currencies?apiKey=${API_KEY}`)
      .then((cu) => {
        const currencies = cu.data.results;
        const objectKeys = Object.keys(currencies);
        axios
          .get(
            `https://restcountries.eu/rest/v2/all
      `,
            {
              Headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }
          )
          .then((res) => {
            const countries = res.data;
            let currenciesWithFlags = objectKeys.map((obj) => {
              let flagFound = countries.find(
                (country) => country.currencies[0].code === obj
              );
              if (obj === "USD")
                return {
                  obj: "USD",
                  currency_name: currencies["USD"].currencyName,
                  flag: "https://restcountries.eu/data/usa.svg",
                };
              else if (!flagFound)
                return {
                  ...obj,
                  currency_name: currencies[obj].currencyName,
                  flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png",
                };
              else if (flagFound)
                return {
                  obj,
                  currency_name: currencies[obj].currencyName,
                  flag: flagFound.flag,
                };
            });
            // Set the initial pair of currencies, I've chosen USD and PLN
            setPair({
              from: currenciesWithFlags[149],
              to: currenciesWithFlags[115],
            });
            // Set the currency list for the user to chose from
            setCurrencies(currenciesWithFlags);
            setLoaded(true);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  }, []);
  // Add commas to output digits
  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const converter = (event) => {
    event.preventDefault();
    if (amount) {
      axios
        .get(
          `https://free.currconv.com/api/v7/convert?apiKey=${API_KEY}&q=${pair.from.obj}_${pair.to.obj}&compact=y`
        )
        .then((resp) => {
          console.log();
          setOutput({
            from: pair.from.obj,
            to: pair.to.obj,
            amount: numberWithCommas(amount),
            result: amount * Object.values(resp.data)[0].val,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  function handlePair(iso, fromTo) {
    const currency = currencies.find((curr) => curr.obj === iso);
    console.log(currency);
    if (fromTo === "from") setPair({ ...pair, from: currency });
    if (fromTo === "to") setPair({ ...pair, to: currency });
  }
  // Check if object is empty by looking at its properties, needed to only display output when necessary.
  function isEmpty(obj) {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return JSON.stringify(obj) === JSON.stringify({});
  }
  return (
    <div className="converter">
      <div className="container">
        <div className="row">
          <h1>Currency Converter</h1>
          {loaded ? (
            <div className="block col-md-6 col-lg-6 com-sm-12">
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  min="0"
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">From</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <img
                      src={pair.from && pair.from.flag}
                      alt={pair.from && pair.from.obj}
                      width="50"
                    />
                  </span>
                  <select
                    className="form-select"
                    onChange={(e) => handlePair(e.target.value, "from")}
                  >
                    <option value={pair.from && pair.from.obj}>
                      {pair.from && pair.from.currency_name}
                    </option>
                    {currencies.map((currency, index) => {
                      return (
                        <option
                          key={index}
                          defaultValue={currency.obj}
                          value={currency.obj}
                        >
                          {currency.currency_name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="mb-3 d-flex justify-content-center">
                <button
                  className="btn btn-swap"
                  aria-label="Swap"
                  onClick={() => setPair({ from: pair.to, to: pair.from })}
                >
                  <i className="bi text-light bi-arrow-repeat"></i>
                </button>
              </div>
              <div className=" mb-3">
                <label className="form-label">To</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <img
                      src={pair.to && pair.to.flag}
                      width="50"
                      alt={pair.from && pair.from.obj}
                    />
                  </span>
                  <select
                    className="form-select"
                    onChange={(e) => handlePair(e.target.value, "to")}
                  >
                    <option value={pair.to && pair.to.obj}>
                      {pair.to && pair.to.currency_name}
                    </option>

                    {currencies.map((currency, index) => {
                      return (
                        <option key={index} value={currency.obj}>
                          {currency.currency_name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {!isEmpty(output) && (
                <p className="text-light">
                  {output.amount} {output.from} =<br />
                  <span>
                    {output.result} {output.to}
                  </span>
                </p>
              )}

              <div className="mb-3 d-flex justify-content-center">
                <button
                  onClick={converter}
                  disabled={!amount ? true : false}
                  className="btn btn-convert"
                >
                  Convert
                </button>
              </div>
            </div>
          ) : (
            <div>Loading ... </div>
          )}
          <p className="copyright">
            Made with <i className="bi bi-heart"></i> By Yanal Shoubaki
          </p>
        </div>
      </div>
    </div>
  );
};

export default Converter;
