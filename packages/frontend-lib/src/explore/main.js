// The exploration harness. Deliberately loads only base.css and NOT tokens.css:
// each direction brings its own token block, because a direction that cannot
// change a radius or a density is a repaint, not a direction.
import '../lib/base.css';
import './directions.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
