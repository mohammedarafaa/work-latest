import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  Highcharts: typeof Highcharts = Highcharts;
  consumptionTrendsChartOptions: Highcharts.Options = {
    chart: { type: 'line' },
    title: { text: 'Daily/Weekly/Monthly Consumption Trends' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: 'Consumption (kWh)' } },
    series: [
      { name: 'Electricity', type: 'line', data: [100, 150, 200, 250, 300, 350] },
      { name: 'Water', type: 'line', data: [50, 75, 100, 125, 150, 175] },
      { name: 'Gas', type: 'line', data: [30, 50, 70, 90, 110, 130] },
    ],
  };
}
