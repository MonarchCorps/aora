// NavigationService.js
import { router } from 'expo-router';

/**
 * Navigates to the specified route.
 * @param {string} route - The path to navigate to (e.g., '/login' or '/register').
 * @param {object} [params] - Optional parameters to pass to the route.
 */
export function navigate(route, params) {
  router.push({ pathname: route, params });
}

/**
 * Replaces the current route with the specified route.
 * @param {string} route - The path to navigate to.
 * @param {object} [params] - Optional parameters to pass to the route.
 */
export function replace(route, params) {
  router.replace({ pathname: route, params });
}

/**
 * Navigates back in the navigation stack.
 */
export function goBack() {
  router.back();
}
