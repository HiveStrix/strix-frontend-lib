// FEEDBACK — everything the system says back.
//
// The family divides by WHO IS WAITING and FOR HOW LONG:
//
//   the system is waiting on a person   Dialog · Confirm · ReviewPanel
//   a person is waiting on the system   Skeleton · Progress
//   the system reports what happened    Toast (it left) · Alert (it is still true)
//   the surface has nothing to show     EmptyState (nothing yet) · ErrorState (it failed)
//
// Pick by that question and the choice is almost never wrong. Pick by how loud
// the message feels and you get the screen where a failed save is a toast, an
// empty list is an error, and a confirmation dialog guards an undo.
//
// `MARKS` travels with Alert: the five tone shapes, the same ones Pill draws.
// It is exported so a product can mark a tone in its own markup without
// inventing a sixth shape. It should eventually live beside Pill in src/lib.
export { default as Dialog } from './Dialog.svelte';
export { default as Confirm } from './Confirm.svelte';
export { default as Toast } from './Toast.svelte';
export { default as Alert, MARKS } from './Alert.svelte';
export { default as EmptyState } from './EmptyState.svelte';
export { default as ErrorState } from './ErrorState.svelte';
export { default as Skeleton } from './Skeleton.svelte';
export { default as Progress } from './Progress.svelte';
export { default as ReviewPanel } from './ReviewPanel.svelte';
