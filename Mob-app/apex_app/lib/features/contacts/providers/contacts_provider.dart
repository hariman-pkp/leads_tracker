import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/contact_model.dart';
import '../repositories/contacts_repository.dart';

final contactsRepositoryProvider =
    Provider<ContactsRepository>((_) => ContactsRepository());

final contactsSearchProvider = StateProvider<String>((_) => '');

const _kContactPageSize = 20;

class ContactsListState {
  final List<ContactModel> contacts;
  final int total;
  final bool isLoadingMore;
  final bool hasMore;
  const ContactsListState({
    this.contacts = const [],
    this.total = 0,
    this.isLoadingMore = false,
    this.hasMore = true,
  });
  ContactsListState copyWith({
    List<ContactModel>? contacts,
    int? total,
    bool? isLoadingMore,
    bool? hasMore,
  }) => ContactsListState(
    contacts: contacts ?? this.contacts,
    total: total ?? this.total,
    isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    hasMore: hasMore ?? this.hasMore,
  );
}

class ContactsListNotifier extends StateNotifier<AsyncValue<ContactsListState>> {
  final ContactsRepository _repo;
  String _search;

  ContactsListNotifier(this._repo, this._search)
      : super(const AsyncValue.loading()) {
    _load(reset: true);
  }

  Future<void> _load({bool reset = false}) async {
    if (reset) {
      state = const AsyncValue.loading();
    } else {
      final current = state.valueOrNull;
      if (current == null || !current.hasMore || current.isLoadingMore) return;
      state = AsyncValue.data(current.copyWith(isLoadingMore: true));
    }

    try {
      final offset   = reset ? 0 : (state.valueOrNull?.contacts.length ?? 0);
      final result   = await _repo.fetchContacts(
        search: _search.isNotEmpty ? _search : null,
        limit:  _kContactPageSize,
        offset: offset,
      );
      final existing = reset ? <ContactModel>[] : (state.valueOrNull?.contacts ?? []);
      final merged   = [...existing, ...result.contacts];
      state = AsyncValue.data(ContactsListState(
        contacts: merged,
        total: result.total,
        isLoadingMore: false,
        hasMore: merged.length < result.total,
      ));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore() => _load(reset: false);

  Future<void> refresh() => _load(reset: true);

  void applySearch(String search) {
    _search = search;
    _load(reset: true);
  }
}

final contactsListProvider =
    StateNotifierProvider<ContactsListNotifier, AsyncValue<ContactsListState>>((ref) {
  final search = ref.watch(contactsSearchProvider);
  final repo   = ref.read(contactsRepositoryProvider);
  return ContactsListNotifier(repo, search);
});
