import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-icon-button/paper-icon-button';
import { SharedStyles } from './shared-styles';

class ChartControls extends LitElement {
  static get properties() {
    return {
      minDate: { type: String },
      maxDate: { type: String },
    };
  }

  constructor() {
    super();
    this.minDate = '';
    this.maxDate = '';
  }

  _increaseFilter() {
    this.dispatchEvent(new CustomEvent('increase'));
  }

  _decreaseFilter() {
    this.dispatchEvent(new CustomEvent('decrease'));
  }

  _addTask() {
    this.dispatchEvent(new CustomEvent('add-task'));
  }

  _downloadChart() {
    this.dispatchEvent(new CustomEvent('download-chart'));
  }

  render() {
    const { minDate, maxDate } = this;
    return (
      html`
          <span class="chart-controls">
            <div class="chart-controls__btn btn-add">
              <paper-icon-button slot="suffix" icon="add" @click='${this._addTask}}'></paper-icon-button>
            </div>
            <div class="chart-controls__btn btn-download">
              <paper-icon-button slot="suffix" icon="file-download" @click='${this._downloadChart}'></paper-icon-button>
            </div>
            <div class="chart-controls__btn btn-decrease">
              <paper-icon-button slot="suffix" icon="chevron-left" @click='${this._decreaseFilter}'></paper-icon-button>
            </div>
            <div class="chart-controls__btn btn-increase">
              <paper-icon-button  icon="chevron-right" @click='${this._increaseFilter}'></paper-icon-button>
            </div>
            <div class="chart-controls__date">${minDate} ${minDate !== maxDate ? html`- ${maxDate}` : ''}</div>
          </span>
      `
    );
  }

  static get styles() {
    return [
      SharedStyles,
      css`
      .chart-controls {
        color: white;
        position: fixed;
        bottom: 32px;
        left: 20px;
        display: flex;
      }

      .chart-controls__btn {
        background-color: black;
        color: white;
        opacity: 0.7;
      }

      .chart-controls__btn:hover {
        opacity: 1;
      }

      .chart-controls__btn.btn-decrease {
        border-radius: 5px 0 0 5px;
      }

      .chart-controls__btn.btn-decrease:hover,
      .chart-controls__btn.btn-increase:hover {
        color: #ec407a;
      }

      .chart-controls__date {
        background-color: black;
        padding: 8px;
        opacity: 0.7;
        border-radius: 0 5px 5px 0;
      }


      .chart-controls__btn.btn-add {
        border-radius: 5px;
        margin-right: 8px;
      }

      .chart-controls__btn.btn-add:hover {
        color: #448aff;
      }

      .chart-controls__btn.btn-download {
        border-radius: 5px;
        margin-right: 8px;
      }

      .chart-controls__btn.btn-download:hover {
        color: #3f51b5;
      }

      @media (max-width: 600px) {
        .chart-controls {
          bottom: 50px;
        }
      }
      `,
    ];
  }
}

window.customElements.define('chart-controls', ChartControls);
