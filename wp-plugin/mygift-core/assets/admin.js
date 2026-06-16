/* MYGIFT Control Center — shared admin behaviours.
 *
 * Generic clone-row repeater + WP media picker, used by every MYGIFT
 * content manager so editors get one consistent, no-code editing experience.
 *
 * Repeater markup contract:
 *   <div class="mg-repeater" data-template="<encoded row HTML with {{i}} index token>">
 *     <div class="mg-rows"> ...existing .mg-row elements... </div>
 *     <button class="button mg-add-row">Add</button>
 *   </div>
 * PHP sanitisers re-sequence rows with array_values(), so removing a row in
 * the middle and leaving an index gap is harmless.
 */
( function ( $ ) {
	'use strict';

	// ── Repeater: add row ──────────────────────────────────────────────────
	$( document ).on( 'click', '.mg-add-row', function ( e ) {
		e.preventDefault();
		var $rep  = $( this ).closest( '.mg-repeater' );
		var $rows = $rep.find( '.mg-rows' ).first();
		var tpl   = $rep.attr( 'data-template' ) || '';
		var index = $rows.children( '.mg-row' ).length;
		// jQuery .attr() already decodes HTML entities in the stored template,
		// so we only need to substitute the running index token.
		var html  = tpl.replace( /\{\{i\}\}/g, index );
		$rows.append( html );
	} );

	// ── Repeater: remove row ───────────────────────────────────────────────
	$( document ).on( 'click', '.mg-remove-row', function ( e ) {
		e.preventDefault();
		$( this ).closest( '.mg-row' ).remove();
	} );

	// ── WP media picker ────────────────────────────────────────────────────
	$( document ).on( 'click', '.mg-pick-image', function ( e ) {
		e.preventDefault();
		var $btn  = $( this );
		var $row  = $btn.closest( '.mg-image-row' );
		var $url  = $row.find( '.mg-image-url' );
		var $prev = $row.find( '.mg-image-preview' );
		var frame = wp.media( {
			title: 'Select image',
			button: { text: 'Use this image' },
			multiple: false
		} );
		frame.on( 'select', function () {
			var att = frame.state().get( 'selection' ).first().toJSON();
			$url.val( att.url ).trigger( 'input' );
			$prev.attr( 'src', att.url ).show();
		} );
		frame.open();
	} );

	// ── Live preview when an image URL is typed/pasted ─────────────────────
	$( document ).on( 'input', '.mg-image-url', function () {
		var v = $( this ).val();
		$( this ).closest( '.mg-image-row' ).find( '.mg-image-preview' )
			.attr( 'src', v ).toggle( v !== '' );
	} );

	// ── Collapsible section toggle (e.g. enable a hero slide) ──────────────
	$( document ).on( 'change', '.mg-toggle', function () {
		var target = $( this ).attr( 'data-target' );
		$( this ).closest( '.mg-row, .mg-slide-box, .mg-section' )
			.find( target ).toggle( $( this ).is( ':checked' ) );
	} );
}( jQuery ) );
