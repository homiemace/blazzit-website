<script lang="ts">
	import '../app.css'; // Ensure that this imports your Tailwind CSS file
	let { children } = $props();
  </script>
  
  {@render children()}
  