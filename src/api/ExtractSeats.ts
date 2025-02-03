// TypeScript
import axios from "axios";
import { Seat } from "../model/Seat";
import config from '../config';

import organizationMockedResponse_seats from '../../mock-data/organization_seats_response_sample.json';
import enterpriseMockedResponse_seats from '../../mock-data/enterprise_seats_response_sample.json';

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(config.github.token ? { Authorization: `token ${config.github.token}` } : {})
};

export const getSeatsApi = async (): Promise<Seat[]> => {
  const perPage = 100;
  let page = 1;
  const seatUrl = `${config.github.apiUrl}/copilot/billing/seats`;
  let seatsData: Seat[] = [];

  let response;

  if (config.mockedData) {
    response = config.scope.type === "organization" ? organizationMockedResponse_seats : enterpriseMockedResponse_seats;
    seatsData = seatsData.concat(response.seats.map((item: any) => new Seat(item)));
    return seatsData;
  }
  else {

    // Fetch the first page to get the total number of seats
    response = await axios.get(seatUrl, {
      headers,
      params: {
        per_page: perPage,
        page: page
      }
    });

    seatsData = seatsData.concat(response.data.seats.map((item: any) => new Seat(item)));
    // Calculate the total pages
    const totalSeats = response.data.total_seats;
    const totalPages = Math.ceil(totalSeats / perPage);

    // Fetch the remaining pages
    for (page = 2; page <= totalPages; page++) {
      response = await axios.get(seatUrl, {
        headers,
        params: {
          per_page: perPage,
          page: page
        }
      });

      seatsData = seatsData.concat(response.data.seats.map((item: any) => new Seat(item)));
    }
  }
  return seatsData;
}
