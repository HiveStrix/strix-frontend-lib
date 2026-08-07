// Las apps normales cargan las hojas del sistema en el DOCUMENTO. Las custom
// properties heredan hacia abajo y todo funciona — incluso hacia dentro de un
// shadow root. La copia que CoreModule.svelte carga en :host es para el caso en
// que nadie las definió arriba.
import '@strix/frontend-lib/tokens.css';
import '@strix/frontend-lib/base.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
