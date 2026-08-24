/**
 * Gift Card Management JavaScript
 * Simple and efficient approach - no complex translations or DOM recreation
 */

function editGiftCard() {
  // Goes through the auth guard, so guests get the login dialog instead of nothing
  if (typeof handleGiftCardClick === 'function') {
    handleGiftCardClick();

    return;
  }

  window?.gift_dialog?.open();
}

var GIFT_HIDDEN_CLASSES = 'd-none hidden zid-hidden';

function isGiftElementHidden($el) {
  return $el.hasClass('d-none') || $el.hasClass('hidden') || $el.hasClass('zid-hidden');
}

function showGiftElement($el) {
  $el.removeClass(GIFT_HIDDEN_CLASSES);
}

function hideGiftElement($el) {
  $el.addClass('d-none');
}

function deleteGiftCard(event) {
  const clickedButton = event?.target instanceof Element
    ? event.target.closest('.gift-card-delete-btn, [data-gift-delete-btn]')
    : null;
  const deleteButton = clickedButton
    ? $(clickedButton)
    : $('.gift-card-delete-btn, [data-gift-delete-btn]');
  const deleteIcon = deleteButton.find('.icon-trash-alt, [data-gift-delete-icon]');
  const deleteProgress = deleteButton.find('.delete-gift-progress, [data-gift-delete-spinner]');

  // Prevent multiple clicks
  if (deleteProgress.length > 0 && !isGiftElementHidden(deleteProgress)) {
    return;
  }

  if (typeof window?.zid?.cart?.removeGiftCard !== 'function') {
    console.error('zid.cart.removeGiftCard is not available');

    return;
  }

  // Show loading state
  hideGiftElement(deleteIcon);
  showGiftElement(deleteProgress);

  window.zid.cart
    .removeGiftCard({ showErrorNotification: true })
    .then(() => {
      $('.cart-gift-card, [data-gift-card-display]').hide();
      removeGiftProductRow(clickedButton);
      updateGiftButtonText(false);

      // Show success alert - get translation from existing element
      const successMessage =
        $('.cart-gift-card').data('gift-removed-success') || 'Gift card removed successfully';

      window.zid?.toaster?.showSuccess(successMessage);
    })
    .catch(err => {
      console.error('Failed to remove gift card:', err);
    })
    .finally(() => {
      showGiftElement(deleteIcon);
      hideGiftElement(deleteProgress);
    });
}

/**
 * When the gift card is a paid card product it is rendered as a row inside the
 * cart products list, so drop that whole row too, not just the summary card.
 */
function removeGiftProductRow(deleteButton) {
  if (!(deleteButton instanceof Element)) {
    return;
  }

  // Outer wrapper first - .cart-product-row alone would leave an empty wrapper behind
  const productRow =
    deleteButton.closest('.cart-product-item, .cart-product-row-wrapper') ||
    deleteButton.closest('.cart-product-row');

  productRow?.remove();
}

function updateGiftCardDisplay(giftData) {
  const giftCardContainer = $('.cart-gift-card');

  // Simply update the values - container always exists
  giftCardContainer.find('.sender-name').text(giftData.sender_name || '');
  giftCardContainer.find('.receiver-name').text(giftData.receiver_name || '');

  // Handle gift card image display
  const giftCardImage = giftCardContainer.find('.gift-card-image');
  const giftIconFallback = giftCardContainer.find('.gift-icon-fallback');

  if (giftData.card_design && giftData.card_design.length > 0) {
    giftCardImage.attr('src', giftData.card_design);
    giftCardImage.removeClass('d-none');
    giftIconFallback.addClass('d-none');
  } else {
    giftCardImage.addClass('d-none');
    giftIconFallback.removeClass('d-none');
  }

  // Handle message display
  const messageContainer = giftCardContainer.find('.message-info');

  if (giftData.gift_message && giftData.gift_message.length > 0) {
    giftCardContainer.find('.gift-message').text(giftData.gift_message);
    messageContainer.show();
  } else {
    messageContainer.hide();
  }

  // Handle media link display
  const mediaLinkContainer = giftCardContainer.find('.media-link-info');

  if (giftData.media_link && giftData.media_link.length > 0) {
    giftCardContainer.find('.gift-media-link').text(giftData.media_link);
    mediaLinkContainer.show();
  } else {
    mediaLinkContainer.hide();
  }

  giftCardContainer.show();
  updateGiftButtonText(true);
}

function updateGiftButtonText(hasGift) {
  const giftButton = $('#gift-btn');

  if (giftButton.length > 0) {
    giftButton.removeClass('gift-added gift-send');
    const editLink = giftButton.find('.gift-edit-link');

    if (hasGift) {
      giftButton.addClass('gift-added');
      editLink.removeClass('d-none').addClass('d-inline');
    } else {
      giftButton.addClass('gift-send');
      editLink.removeClass('d-inline').addClass('d-none');
    }
  }
}

function onGiftSubmitted() {
  window.location.reload();
}

window.addEventListener('vitrin:gift:submitted', onGiftSubmitted);

function setupEventDelegation() {
  document.addEventListener('click', e => {
    if (!(e.target instanceof Element)) {
      return;
    }

    const btn = e.target.closest('[data-action]');

    if (!btn) {
      if (e.target.closest('.gift-card-delete-btn, [data-gift-delete-btn]')) {
        e.preventDefault();
        deleteGiftCard(e);
      } else if (e.target.closest('.gift-card-edit-btn, [data-gift-edit-link]')) {
        e.preventDefault();
        editGiftCard();
      }

      return;
    }

    switch (btn.dataset.action) {
      case 'gift-edit':
        e.preventDefault();
        editGiftCard();
        break;

      case 'gift-delete':
        e.preventDefault();
        deleteGiftCard(e);
        break;

      case 'gift-open':
        e.preventDefault();
        handleGiftCardClick();
        break;

      default:
        break;
    }
  });

setupEventDelegation();
