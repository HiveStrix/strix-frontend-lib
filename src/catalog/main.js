import '../lib/tokens.css';
import '../lib/base.css';
import './motion.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
